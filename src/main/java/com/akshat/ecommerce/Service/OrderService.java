package com.akshat.ecommerce.Service;

import com.akshat.ecommerce.DTO.common.PageResponseDTO;
import com.akshat.ecommerce.DTO.order.OrderItemDTO;
import com.akshat.ecommerce.DTO.order.OrderRequestDTO;
import com.akshat.ecommerce.DTO.order.OrderResponseDTO;
import com.akshat.ecommerce.Entity.*;
import com.akshat.ecommerce.Repository.*;
import com.akshat.ecommerce.exception.BadRequestException;
import com.akshat.ecommerce.exception.ResourceNotFoundException;
import com.akshat.ecommerce.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentService paymentService;

    @Transactional
    public OrderResponseDTO createOrder(Long userId, OrderRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Your cart is empty. Add items before placing an order.");
        }

        // Filter out orphaned cart items (product was deleted)
        List<CartItem> validItems = cartItems.stream()
                .filter(item -> item.getProduct() != null)
                .collect(Collectors.toList());

        if (validItems.isEmpty()) {
            throw new BadRequestException("No valid items in cart. Some products may have been removed.");
        }

        // Validate stock for all items before processing
        for (CartItem cartItem : validItems) {
            Product product = cartItem.getProduct();
            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName()
                        + ". Available: " + product.getQuantity());
            }
        }

        BigDecimal subtotal = validItems.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(new BigDecimal("0.10"));
        BigDecimal shipping = new BigDecimal("10.00");
        BigDecimal total = subtotal.add(tax).add(shipping);

        Order order = new Order();
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUser(user);
        order.setSubtotal(subtotal);
        order.setTaxAmount(tax);
        order.setShippingCost(shipping);
        order.setTotalAmount(total);
        order.setNotes(request.getNotes());

        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : validItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setProductSku(cartItem.getProduct().getSku());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItem.setTotalPrice(cartItem.getTotalPrice());
            orderItem.setImageUrl(cartItem.getProduct().getImageUrl());
            orderItemRepository.save(orderItem);

            // Decrement stock
            Product product = cartItem.getProduct();
            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        cartItemRepository.deleteByUserId(userId);

        // Determine payment method (default to RAZORPAY if not provided)
        String paymentMethod = (request.getPaymentMethod() != null)
                ? request.getPaymentMethod().toUpperCase().trim()
                : "RAZORPAY";

        boolean isCod = "COD".equals(paymentMethod);

        if (isCod) {
            // Cash on Delivery: record payment as pending, mark order as PROCESSING
            Payment codPayment = new Payment();
            codPayment.setOrder(savedOrder);
            codPayment.setPaymentMethod("COD");
            codPayment.setAmount(savedOrder.getTotalAmount());
            codPayment.setCurrency(savedOrder.getCurrency());
            codPayment.setStatus(Payment.Status.PENDING);
            codPayment.setTransactionId("COD-" + savedOrder.getOrderNumber());
            paymentRepository.save(codPayment);

            savedOrder.setStatus(Order.Status.PROCESSING);
            savedOrder.setPaymentStatus(Order.PaymentStatus.PENDING);
            orderRepository.save(savedOrder);

            OrderResponseDTO response = mapToResponse(orderRepository.findById(savedOrder.getId())
                    .orElse(savedOrder));
            response.setRazorpayOrderId(null);
            response.setRazorpayKey(null);
            return response;
        }

        // Razorpay flow
        String razorpayOrderId = null;
        try {
            razorpayOrderId = paymentService.createRazorpayOrder(savedOrder);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initiate payment: " + e.getMessage(), e);
        }

        OrderResponseDTO response = mapToResponse(orderRepository.findById(savedOrder.getId())
                .orElse(savedOrder));

        response.setRazorpayOrderId(razorpayOrderId);
        response.setRazorpayKey(paymentService.getKeyId());

        return response;
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return mapToResponse(order);
    }



    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderByIdForUser(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to view this order.");
        }

        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponseDTO cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to cancel this order.");
        }

        if (order.getStatus() != Order.Status.PENDING && order.getStatus() != Order.Status.PROCESSING) {
            throw new BadRequestException("Order cannot be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(Order.Status.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());

        // Restore stock
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        return mapToResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<OrderResponseDTO> getAllOrders(int page, int size, String status) {
        Page<Order> ordersPage;
        if (status != null && !status.isEmpty()) {
            try {
                Order.Status orderStatus = Order.Status.valueOf(status.toUpperCase());
                List<Order> filtered = orderRepository.findByStatus(orderStatus);
                int start = page * size;
                int end = Math.min(start + size, filtered.size());
                List<OrderResponseDTO> content = filtered.subList(start, Math.min(end, filtered.size())).stream()
                        .map(this::mapToResponse).collect(Collectors.toList());
                PageResponseDTO<OrderResponseDTO> dto = new PageResponseDTO<>();
                dto.setContent(content);
                dto.setPage(page);
                dto.setSize(size);
                dto.setTotalElements((long) filtered.size());
                dto.setTotalPages((int) Math.ceil((double) filtered.size() / size));
                dto.setLast(end >= filtered.size());
                return dto;
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + status);
            }
        }
        ordersPage = orderRepository.findAll(PageRequest.of(page, size));
        List<OrderResponseDTO> content = ordersPage.getContent().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
        PageResponseDTO<OrderResponseDTO> response = new PageResponseDTO<>();
        response.setContent(content);
        response.setPage(ordersPage.getNumber());
        response.setSize(ordersPage.getSize());
        response.setTotalElements(ordersPage.getTotalElements());
        response.setTotalPages(ordersPage.getTotalPages());
        response.setLast(ordersPage.isLast());
        return response;
    }

    @Transactional
    public OrderResponseDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        try {
            order.setStatus(Order.Status.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
        order.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponseDTO updatePaymentStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        try {
            order.setPaymentStatus(Order.PaymentStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment status: " + status);
        }
        order.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponseDTO updateShippingStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        try {
            order.setShippingStatus(Order.ShippingStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid shipping status: " + status);
        }
        order.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(orderRepository.save(order));
    }

    private OrderResponseDTO mapToResponse(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentStatus(order.getPaymentStatus().name());
        dto.setShippingStatus(order.getShippingStatus().name());
        dto.setSubtotal(order.getSubtotal());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setShippingCost(order.getShippingCost());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCurrency(order.getCurrency());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getOrderItems() != null) {
            dto.setOrderItems(order.getOrderItems().stream()
                    .map(item -> {
                        OrderItemDTO itemDto = new OrderItemDTO();
                        itemDto.setId(item.getId());
                        itemDto.setProductName(item.getProductName());
                        itemDto.setProductSku(item.getProductSku());
                        itemDto.setQuantity(item.getQuantity());
                        itemDto.setUnitPrice(item.getUnitPrice());
                        itemDto.setTotalPrice(item.getTotalPrice());
                        itemDto.setImageUrl(item.getImageUrl());
                        return itemDto;
                    })
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public String updatePaymentMethod(Long OrderId, String method)
    {
        Order order = orderRepository.findById(OrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", OrderId));
        return "success";
    }
}