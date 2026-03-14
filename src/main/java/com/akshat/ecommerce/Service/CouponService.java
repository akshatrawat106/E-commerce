package com.akshat.ecommerce.Service;

import com.akshat.ecommerce.DTO.coupon.CouponRequestDTO;
import com.akshat.ecommerce.DTO.coupon.CouponResponseDTO;
import com.akshat.ecommerce.Entity.Coupon;
import com.akshat.ecommerce.Repository.CouponRepository;
import com.akshat.ecommerce.exception.BadRequestException;
import com.akshat.ecommerce.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public Map<String, Object> validateAndCalculateDiscount(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code: " + code));

        if (!coupon.getIsActive()) {
            throw new BadRequestException("This coupon is no longer active");
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This coupon has expired");
        }

        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new BadRequestException("This coupon has reached its maximum usage limit");
        }

        if (orderAmount.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new BadRequestException("Order amount must be at least " + coupon.getMinimumOrderAmount() + " to use this coupon");
        }

        BigDecimal discountAmount;
        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discountAmount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discountAmount = coupon.getDiscountValue().min(orderAmount);
        }

        BigDecimal finalAmount = orderAmount.subtract(discountAmount);

        Map<String, Object> result = new HashMap<>();
        result.put("valid", true);
        result.put("code", coupon.getCode());
        result.put("discountType", coupon.getDiscountType());
        result.put("discountValue", coupon.getDiscountValue());
        result.put("discountAmount", discountAmount);
        result.put("originalAmount", orderAmount);
        result.put("finalAmount", finalAmount);
        return result;
    }

    @Transactional
    public CouponResponseDTO createCoupon(CouponRequestDTO request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BadRequestException("Coupon code already exists: " + request.getCode());
        }

        Coupon coupon = new Coupon();
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinimumOrderAmount(request.getMinimumOrderAmount() != null
                ? request.getMinimumOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxUses(request.getMaxUses());
        coupon.setExpiresAt(request.getExpiresAt());

        return mapToResponse(couponRepository.save(coupon));
    }

    public List<CouponResponseDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CouponResponseDTO getCouponById(Long id) {
        return mapToResponse(couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id)));
    }

    @Transactional
    public CouponResponseDTO updateCoupon(Long id, CouponRequestDTO request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id));

        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinimumOrderAmount(request.getMinimumOrderAmount() != null
                ? request.getMinimumOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxUses(request.getMaxUses());
        coupon.setExpiresAt(request.getExpiresAt());

        return mapToResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponseDTO setActive(Long id, Boolean active) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id));
        coupon.setIsActive(active);
        return mapToResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon", id);
        }
        couponRepository.deleteById(id);
    }

    private CouponResponseDTO mapToResponse(Coupon coupon) {
        CouponResponseDTO dto = new CouponResponseDTO();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDiscountType(coupon.getDiscountType());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMinimumOrderAmount(coupon.getMinimumOrderAmount());
        dto.setMaxUses(coupon.getMaxUses());
        dto.setUsedCount(coupon.getUsedCount());
        dto.setIsActive(coupon.getIsActive());
        dto.setExpiresAt(coupon.getExpiresAt());
        dto.setCreatedAt(coupon.getCreatedAt());
        return dto;
    }
}
