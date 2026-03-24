    package com.phonestore.util;

    import javax.crypto.Mac;
    import javax.crypto.spec.SecretKeySpec;
    import java.net.URLEncoder;
    import java.nio.charset.StandardCharsets;
    import java.util.*;
    import java.net.URLEncoder;
    import java.nio.charset.StandardCharsets;

    public class VnPayUtil {

        public static String hmacSHA512(String key, String data){
            try{
                Mac hmac512 = Mac.getInstance("HmacSHA512");
                SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "HmacSHA512");
                hmac512.init(secretKey);

                byte[] bytes = hmac512.doFinal(data.getBytes());

                StringBuilder hash = new StringBuilder();
                for(byte b : bytes){
                    hash.append(String.format("%02x", b));
                }
                return hash.toString();

            }catch(Exception e){
                throw new RuntimeException(e);
            }
        }

        // build lại chuỗi hash giống lúc gửi


        public static String buildHashData(Map<String, String> params){

            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();

            for(String field : fieldNames){
                if(field.startsWith("vnp_") && !field.equals("vnp_SecureHash")){
                    String value = params.get(field);

                    if(value != null && !value.isEmpty()){
                        if(hashData.length() > 0){
                            hashData.append("&");
                        }

                        try {
                            hashData.append(field)
                                    .append("=")
                                    .append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                        } catch (Exception e) {
                            throw new RuntimeException(e);
                        }
                    }
                }
            }

            return hashData.toString();
        }
    }