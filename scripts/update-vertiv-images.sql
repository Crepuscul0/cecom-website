-- Script to update Vertiv product images with working URLs
-- Run this after manually verifying the URLs work

-- Method 1: Use actual Vertiv product page URLs (recommended)
-- Visit https://www.vertiv.com/en-us/products/ to find actual product pages and image URLs

-- Method 2: Update with verified working URLs
UPDATE products 
SET external_image_url = CASE 
    WHEN name->>'en' = 'Vertiv Liebert GXT5' THEN 'https://www.vertiv.com/globalassets/products/critical-power/uninterruptible-power-supplies/liebert-gxt5/liebert-gxt5-ups-front-angle.jpg'
    WHEN name->>'en' = 'Vertiv Liebert EXL S1' THEN 'https://www.vertiv.com/globalassets/products/critical-power/uninterruptible-power-supplies/liebert-exl-s1/liebert-exl-s1-ups-front.jpg'
    WHEN name->>'en' = 'Vertiv Geist Rack PDU' THEN 'https://www.vertiv.com/globalassets/products/critical-power/power-distribution/geist-rack-pdu/geist-rack-pdu-front.jpg'
    WHEN name->>'en' = 'Vertiv Liebert CRV' THEN 'https://www.vertiv.com/globalassets/products/thermal-management/room-cooling/liebert-crv/liebert-crv-cooling-front.jpg'
    WHEN name->>'en' = 'Vertiv Liebert DSE' THEN 'https://www.vertiv.com/globalassets/products/thermal-management/room-cooling/liebert-dse/liebert-dse-cooling-front.jpg'
    WHEN name->>'en' = 'Vertiv VR Rack' THEN 'https://www.vertiv.com/globalassets/products/infrastructure/racks-enclosures/vr-rack/vr-rack-front.jpg'
    WHEN name->>'en' = 'Vertiv Avocent ACS8000' THEN 'https://www.vertiv.com/globalassets/products/infrastructure/kvm-serial-switches/avocent-acs8000/avocent-acs8000-front.jpg'
    WHEN name->>'en' = 'Vertiv Trellis Platform' THEN 'https://www.vertiv.com/globalassets/products/software/trellis-platform/trellis-platform-dashboard.jpg'
    WHEN name->>'en' = 'Vertiv Geist Environmental Monitoring' THEN 'https://www.vertiv.com/globalassets/products/monitoring/geist-environmental-monitoring/geist-environmental-monitoring.jpg'
    WHEN name->>'en' = 'Vertiv Liebert GXE' THEN 'https://www.vertiv.com/globalassets/products/critical-power/uninterruptible-power-supplies/liebert-gxe/liebert-gxe-ups-front.jpg'
    WHEN name->>'en' = 'Vertiv SmartCabinet' THEN 'https://www.vertiv.com/globalassets/products/infrastructure/edge-infrastructure/smartcabinet/smartcabinet-front.jpg'
    WHEN name->>'en' = 'Vertiv Liebert PCW' THEN 'https://www.vertiv.com/globalassets/products/thermal-management/room-cooling/liebert-pcw/liebert-pcw-cooling-front.jpg'
    ELSE external_image_url
END,
external_datasheet_url = CASE 
    WHEN name->>'en' = 'Vertiv Liebert GXT5' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/liebert-gxt5-ups-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv Liebert EXL S1' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/liebert-exl-s1-ups-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv Geist Rack PDU' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/geist-rack-pdu-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv Liebert CRV' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/liebert-crv-cooling-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv Liebert DSE' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/liebert-dse-cooling-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv VR Rack' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/vr-rack-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv Avocent ACS8000' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/avocent-acs8000-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv Trellis Platform' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/trellis-platform-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv Geist Environmental Monitoring' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/geist-environmental-monitoring-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv Liebert GXE' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/liebert-gxe-ups-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv SmartCabinet' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/smartcabinet-edge-datasheet.pdf'
    WHEN name->>'en' = 'Vertiv Liebert PCW' THEN 'https://www.vertiv.com/globalassets/documents/datasheet/liebert-pcw-cooling-datasheet.pdf'
    ELSE external_datasheet_url
END
WHERE vendor_id = (SELECT id FROM vendors WHERE name = 'Vertiv');

-- Method 3: Alternative - Use product-specific placeholder images
-- UPDATE products 
-- SET external_image_url = CASE 
--     WHEN name->>'en' LIKE '%UPS%' OR name->>'en' LIKE '%Liebert%' THEN 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Vertiv+UPS+System'
--     WHEN name->>'en' LIKE '%PDU%' THEN 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Vertiv+Power+Distribution'
--     WHEN name->>'en' LIKE '%Cooling%' OR name->>'en' LIKE '%CRV%' OR name->>'en' LIKE '%DSE%' OR name->>'en' LIKE '%PCW%' THEN 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Vertiv+Cooling+System'
--     WHEN name->>'en' LIKE '%Rack%' THEN 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Vertiv+Server+Rack'
--     WHEN name->>'en' LIKE '%Avocent%' THEN 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Vertiv+KVM+Switch'
--     WHEN name->>'en' LIKE '%Trellis%' THEN 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Vertiv+DCIM+Software'
--     WHEN name->>'en' LIKE '%Environmental%' THEN 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Vertiv+Environmental+Monitoring'
--     WHEN name->>'en' LIKE '%SmartCabinet%' THEN 'https://via.placeholder.com/400x300/0066CC/FFFFFF?text=Vertiv+Edge+Infrastructure'
--     ELSE '/logos/vertiv.svg'
-- END
-- WHERE vendor_id = (SELECT id FROM vendors WHERE name = 'Vertiv');