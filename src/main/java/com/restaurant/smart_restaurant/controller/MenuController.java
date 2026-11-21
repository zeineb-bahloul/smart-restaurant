package com.restaurant.smart_restaurant.controller;

import com.restaurant.smart_restaurant.dto.MenuItemDto;
import com.restaurant.smart_restaurant.model.MenuItem;
import com.restaurant.smart_restaurant.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public ResponseEntity<List<MenuItem>> getAll() {
        return ResponseEntity.ok(menuService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> create(@Valid @RequestBody MenuItemDto dto) {
        return ResponseEntity.ok(menuService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> update(@PathVariable Long id, @Valid @RequestBody MenuItemDto dto) {
        return ResponseEntity.ok(menuService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        menuService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-available")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> toggleAvailable(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.toggleAvailable(id));
    }
}
