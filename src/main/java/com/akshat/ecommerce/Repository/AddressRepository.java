package com.akshat.ecommerce.Repository;

import com.akshat.ecommerce.Entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserId(Long userId);

    List<Address> findByUserIdAndType(Long userId, Address.Type type);

    List<Address> findByUserIdAndIsDefaultTrue(Long userId);
}