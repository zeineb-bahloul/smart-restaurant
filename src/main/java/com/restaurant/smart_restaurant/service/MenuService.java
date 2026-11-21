package com.restaurant.smart_restaurant.service;

import com.restaurant.smart_restaurant.dto.MenuItemDto;
import com.restaurant.smart_restaurant.model.Category;
import com.restaurant.smart_restaurant.model.MenuItem;
import com.restaurant.smart_restaurant.repository.CategoryRepository;
import com.restaurant.smart_restaurant.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    public MenuService(MenuItemRepository menuItemRepository, CategoryRepository categoryRepository) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<MenuItem> getAll() {
        return menuItemRepository.findAll();
    }

    public MenuItem getById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plat non trouvé avec l'id : " + id));
    }

    @Transactional
    public MenuItem create(MenuItemDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Catégorie non trouvée avec l'id : " + dto.getCategoryId()));

        MenuItem menuItem = MenuItem.builder()
                .category(category)
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .available(true)
                .imageUrl(dto.getImageUrl())
                .build();

        return menuItemRepository.save(menuItem);
    }

    @Transactional
    public MenuItem update(Long id, MenuItemDto dto) {
        MenuItem menuItem = getById(id);
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Catégorie non trouvée avec l'id : " + dto.getCategoryId()));

        menuItem.setCategory(category);
        menuItem.setName(dto.getName());
        menuItem.setDescription(dto.getDescription());
        menuItem.setPrice(dto.getPrice());
        menuItem.setImageUrl(dto.getImageUrl());

        return menuItemRepository.save(menuItem);
    }

    @Transactional
    public void delete(Long id) {
        MenuItem menuItem = getById(id);
        menuItemRepository.delete(menuItem);
    }

    @Transactional
    public MenuItem toggleAvailable(Long id) {
        MenuItem menuItem = getById(id);
        menuItem.setAvailable(!menuItem.isAvailable());
        return menuItemRepository.save(menuItem);
    }
}
