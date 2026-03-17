package com.phonestore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // danh mục cha
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parent;

    // danh mục con
    @OneToMany(mappedBy = "parent")
    @JsonIgnore

    private List<Category> children;
}