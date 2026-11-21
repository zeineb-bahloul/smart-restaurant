-- Mise à jour des URLs d'images par ID numérique pour éviter tout conflit d'encodage de caractères accentués (é, à) sur Windows
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80' 
WHERE id = 1; -- Soupe à l'oignon

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80' 
WHERE id = 2; -- Salade César

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' 
WHERE id = 3; -- Filet Mignon de Boeuf

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80' 
WHERE id = 4; -- Saumon Gratiné au Four

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80' 
WHERE id = 5; -- Risotto aux Truffes
