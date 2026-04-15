package com.phonestore.service;

import com.phonestore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.phonestore.entity.OrderStatus;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;


    // 🔥 Tổng quan dashboard
    public Map<String, Object> getDashboard(){

        Long revenue = orderRepository.sumRevenue();
        Long orders = orderRepository.count();
        Long products = productRepository.count();
        Long users = userRepository.count();

        return Map.of(
                "revenue", revenue != null ? revenue : 0,
                "orders", orders,
                "products", products,
                "users", users
        );
    }

    // 📈 Doanh thu theo tháng
    public List<Object[]> revenueByMonth(){
        return orderRepository.revenueByMonth();
    }

    // 📊 Sản phẩm theo danh mục
    public List<Object[]> productByCategory(){
        return productRepository.countByCategory();
    }


    // 📈 Doanh thu theo ngày
    public List<Object[]> revenueByDay(){
        return orderRepository.revenueByDay();
    }

    // 📈 Doanh thu theo năm
    public List<Object[]> revenueByYear(){
        return orderRepository.revenueByYear();
    }

    // 🔥 COD vs VNPAY
    public List<Object[]> paymentMethodStats(){
        return paymentRepository.countByMethod();
    }
    // 🔥 TOP 5 KHÁCH HÀNG
    public List<Object[]> topCustomers(){
        return orderRepository.topCustomers()
                .stream()
                .limit(5)
                .toList();
    }

    // 🔥 TOP 5 SẢN PHẨM
    public List<Object[]> topProducts(){
        return orderItemRepository.topProducts(PageRequest.of(0, 5));
    }

    public Long getRevenueByDay(String date){
        Long result = orderRepository.revenueByExactDay(date);
        return result != null ? result : 0;
    }

    public Long getRevenueByMonth(int month, int year){
        Long result = orderRepository.revenueByMonthYear(month, year);
        return result != null ? result : 0;
    }

    public Long getRevenueByYear(int year){
        Long result = orderRepository.revenueByYearOnly(year);
        return result != null ? result : 0;
    }

    public List<Object[]> getAllCustomers(){
        return orderRepository.allCustomersRevenue(OrderStatus.DONE);
    }
}