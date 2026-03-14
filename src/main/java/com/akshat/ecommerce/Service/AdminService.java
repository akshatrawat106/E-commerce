package com.akshat.ecommerce.Service;

import com.akshat.ecommerce.DTO.admin.AdminDashboardDTO;
import com.akshat.ecommerce.DTO.product.ProductResponseDTO;
import com.akshat.ecommerce.Entity.Order;
import com.akshat.ecommerce.Entity.Product;
import com.akshat.ecommerce.Repository.*;
import com.akshat.ecommerce.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductService productService;

    public AdminDashboardDTO getDashboardStats() {
        AdminDashboardDTO stats = new AdminDashboardDTO();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalProducts(productRepository.count());
        stats.setTotalOrders(orderRepository.count());
        stats.setTotalCategories(categoryRepository.count());

        stats.setPendingOrders((long) orderRepository.findByStatus(Order.Status.PENDING).size());
        stats.setProcessingOrders((long) orderRepository.findByStatus(Order.Status.PROCESSING).size());
        stats.setShippedOrders((long) orderRepository.findByStatus(Order.Status.SHIPPED).size());
        stats.setDeliveredOrders((long) orderRepository.findByStatus(Order.Status.DELIVERED).size());
        stats.setCancelledOrders((long) orderRepository.findByStatus(Order.Status.CANCELLED).size());

        // Total revenue from PAID orders
        BigDecimal revenue = orderRepository.findByPaymentStatus(Order.PaymentStatus.PAID)
                .stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(revenue);

        List<Product> allProducts = productRepository.findAll();
        stats.setLowStockProducts(allProducts.stream()
                .filter(p -> p.getQuantity() != null && p.getQuantity() > 0 && p.getQuantity() < 10)
                .count());
        stats.setOutOfStockProducts(allProducts.stream()
                .filter(p -> p.getQuantity() == null || p.getQuantity() == 0)
                .count());

        return stats;
    }

    public List<ProductResponseDTO> getLowStockProducts(int threshold) {
        return productRepository.findAll().stream()
                .filter(p -> p.getQuantity() != null && p.getQuantity() < threshold)
                .map(p -> productService.getProductById(p.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponseDTO updateProductStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        product.setQuantity(quantity);
        productRepository.save(product);
        return productService.getProductById(productId);
    }

    @Transactional
    public ProductResponseDTO setProductFeatured(Long productId, Boolean featured) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        product.setIsFeatured(featured);
        productRepository.save(product);
        return productService.getProductById(productId);
    }

    @Transactional
    public ProductResponseDTO setProductActive(Long productId, Boolean active) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        product.setIsActive(active);
        productRepository.save(product);
        return productService.getProductById(productId);
    }
}
