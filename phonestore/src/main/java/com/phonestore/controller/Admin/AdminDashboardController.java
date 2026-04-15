package com.phonestore.controller.Admin;

import com.phonestore.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    // 🔥 Tổng dashboard
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(){
        return dashboardService.getDashboard();
    }

    // 📈 Chart doanh thu
    @GetMapping("/revenue-month")
    public List<Object[]> revenueMonth(){
        return dashboardService.revenueByMonth();
    }

    @GetMapping("/revenue-day")
    public List<Object[]> revenueDay(){
        return dashboardService.revenueByDay();
    }

    @GetMapping("/revenue-year")
    public List<Object[]> revenueYear(){
        return dashboardService.revenueByYear();
    }

    @GetMapping("/payment-method")
    public List<Object[]> paymentMethod(){
        return dashboardService.paymentMethodStats();
    }
    @GetMapping("/top-customers")
    public List<Object[]> topCustomers(){
        return dashboardService.topCustomers();
    }

    // 📊 Category chart
    @GetMapping("/product-category")
    public List<Object[]> productCategory(){
        return dashboardService.productByCategory();
    }

    // 🔥 Top sản phẩm
    @GetMapping("/top-products")
    public List<Object[]> topProducts(){
        return dashboardService.topProducts();
    }

    @GetMapping("/revenue/filter/day")
    public Long revenueByDay(@RequestParam String date){
        return dashboardService.getRevenueByDay(date);
    }

    @GetMapping("/revenue/filter/month")
    public Long revenueByMonth(@RequestParam int month,
                               @RequestParam int year){
        return dashboardService.getRevenueByMonth(month, year);
    }
    @GetMapping("/revenue/filter/year")
    public Long revenueByYear(@RequestParam int year){
        return dashboardService.getRevenueByYear(year);
    }
    @GetMapping("/customers-revenue")
    public List<Object[]> getAllCustomers(){
        return dashboardService.getAllCustomers();
    }
}