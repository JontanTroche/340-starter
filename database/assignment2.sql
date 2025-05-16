-- Create Tony Stark account
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iamironman');

-- Update Tony's account type to Admin
UPDATE public.account
SET account_type = 'Admin'::account_type
WHERE account_email = 'tony@starkent.com';

-- Delete Tony's account
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- Update Hummer'sdescription
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;

-- Inner join for sport cars
SELECT inv_make, inv_model, classification_name
FROM public.inventory
INNER JOIN public.classification
    ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';

--add "vehicles" to the inv_image and inv_thumbnail
UPDATE public.inventory
SET 
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');