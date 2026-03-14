package com.akshat.ecommerce.Service;

import com.akshat.ecommerce.DTO.address.AddressRequestDTO;
import com.akshat.ecommerce.DTO.address.AddressResponseDTO;
import com.akshat.ecommerce.Entity.Address;
import com.akshat.ecommerce.Entity.User;
import com.akshat.ecommerce.Repository.AddressRepository;
import com.akshat.ecommerce.Repository.UserRepository;
import com.akshat.ecommerce.exception.ResourceNotFoundException;
import com.akshat.ecommerce.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public AddressResponseDTO addAddress(Long userId, AddressRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // If this is set as default, clear existing defaults
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddresses(userId);
        }

        Address address = buildAddress(user, request);
        return mapToResponse(addressRepository.save(address));
    }

    public List<AddressResponseDTO> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AddressResponseDTO getAddressById(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this address.");
        }
        return mapToResponse(address);
    }

    @Transactional
    public AddressResponseDTO updateAddress(Long userId, Long addressId, AddressRequestDTO request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to update this address.");
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddresses(userId);
        }

        if (request.getType() != null && !request.getType().isBlank()) {
            address.setType(Address.Type.valueOf(request.getType().toUpperCase()));
        }
        address.setFirstName(request.getFirstName());
        address.setLastName(request.getLastName());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setPhone(request.getPhone());
        address.setIsDefault(request.getIsDefault());

        return mapToResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to delete this address.");
        }
        addressRepository.delete(address);
    }

    @Transactional
    public AddressResponseDTO setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to modify this address.");
        }

        clearDefaultAddresses(userId);
        address.setIsDefault(true);
        return mapToResponse(addressRepository.save(address));
    }

    private void clearDefaultAddresses(Long userId) {
        addressRepository.findByUserId(userId).stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsDefault()))
                .forEach(a -> {
                    a.setIsDefault(false);
                    addressRepository.save(a);
                });
    }

    private Address buildAddress(User user, AddressRequestDTO request) {
        Address address = new Address();
        address.setUser(user);
        if (request.getType() != null && !request.getType().isBlank()) {
            address.setType(Address.Type.valueOf(request.getType().toUpperCase()));
        }
        address.setFirstName(request.getFirstName());
        address.setLastName(request.getLastName());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setPhone(request.getPhone());
        address.setIsDefault(request.getIsDefault());
        return address;
    }

    private AddressResponseDTO mapToResponse(Address address) {
        AddressResponseDTO dto = new AddressResponseDTO();
        dto.setId(address.getId());
        dto.setType(address.getType().name());
        dto.setFirstName(address.getFirstName());
        dto.setLastName(address.getLastName());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setPhone(address.getPhone());
        dto.setIsDefault(address.getIsDefault());
        return dto;
    }
}
