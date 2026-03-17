package com.phonestore.repository;

import com.phonestore.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ImageRepository extends JpaRepository<Image, Long> {
    @Modifying
    @Query("DELETE FROM Image i WHERE i.variant.id = :variantId")
    void deleteByVariantId(@Param("variantId") Long variantId);

}
