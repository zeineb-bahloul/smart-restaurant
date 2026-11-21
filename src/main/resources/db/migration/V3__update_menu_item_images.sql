-- Mise à jour des URLs d'images pour le menu avec des vraies photos gastronomiques haute définition de Unsplash
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1620418029653-5683416bfa5e?auto=format&fit=crop&w=600&q=80' 
WHERE name = 'Soupe à l''oignon';

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80' 
WHERE name = 'Salade César';

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' 
WHERE name = 'Filet Mignon de Boeuf';

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1485921325814-a5341f611740?auto=format&fit=crop&w=600&q=80' 
WHERE name = 'Saumon Gratiné au Four';

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80' 
WHERE name = 'Risotto aux Truffes';
