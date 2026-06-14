
-- Security hardening: lock down SECURITY DEFINER functions (only triggers call them)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_conversation() FROM PUBLIC, anon, authenticated;

-- Storage policies: listing-images (signed urls only via app; auth users can read/write own)
CREATE POLICY "Authenticated read listing images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'listing-images');
CREATE POLICY "Authenticated upload listing images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners update listing images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners delete listing images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'listing-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated read avatars" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Seed categories
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Textbooks', 'textbooks', 'BookOpen', 1),
  ('Electronics', 'electronics', 'Laptop', 2),
  ('Furniture', 'furniture', 'Sofa', 3),
  ('Clothing', 'clothing', 'Shirt', 4),
  ('Tickets', 'tickets', 'Ticket', 5),
  ('Housing', 'housing', 'Home', 6),
  ('Services', 'services', 'Briefcase', 7),
  ('Food & Meal Swipes', 'food', 'UtensilsCrossed', 8),
  ('Other', 'other', 'Package', 99);

-- Seed universities (.edu / .ac.* domains)
INSERT INTO public.universities (name, short_name, country, city, email_domains) VALUES
  ('Harvard University', 'Harvard', 'USA', 'Cambridge, MA', ARRAY['harvard.edu','college.harvard.edu']),
  ('Stanford University', 'Stanford', 'USA', 'Stanford, CA', ARRAY['stanford.edu']),
  ('Massachusetts Institute of Technology', 'MIT', 'USA', 'Cambridge, MA', ARRAY['mit.edu']),
  ('Yale University', 'Yale', 'USA', 'New Haven, CT', ARRAY['yale.edu']),
  ('Princeton University', 'Princeton', 'USA', 'Princeton, NJ', ARRAY['princeton.edu']),
  ('Columbia University', 'Columbia', 'USA', 'New York, NY', ARRAY['columbia.edu']),
  ('University of California, Berkeley', 'UC Berkeley', 'USA', 'Berkeley, CA', ARRAY['berkeley.edu']),
  ('University of California, Los Angeles', 'UCLA', 'USA', 'Los Angeles, CA', ARRAY['ucla.edu','g.ucla.edu']),
  ('New York University', 'NYU', 'USA', 'New York, NY', ARRAY['nyu.edu']),
  ('University of Michigan', 'U-M', 'USA', 'Ann Arbor, MI', ARRAY['umich.edu']),
  ('University of Texas at Austin', 'UT Austin', 'USA', 'Austin, TX', ARRAY['utexas.edu']),
  ('University of Toronto', 'U of T', 'Canada', 'Toronto', ARRAY['utoronto.ca','mail.utoronto.ca']),
  ('McGill University', 'McGill', 'Canada', 'Montreal', ARRAY['mcgill.ca','mail.mcgill.ca']),
  ('University of British Columbia', 'UBC', 'Canada', 'Vancouver', ARRAY['ubc.ca','student.ubc.ca']),
  ('University of Oxford', 'Oxford', 'UK', 'Oxford', ARRAY['ox.ac.uk']),
  ('University of Cambridge', 'Cambridge', 'UK', 'Cambridge', ARRAY['cam.ac.uk']),
  ('Imperial College London', 'Imperial', 'UK', 'London', ARRAY['imperial.ac.uk']),
  ('University College London', 'UCL', 'UK', 'London', ARRAY['ucl.ac.uk']),
  ('University of Edinburgh', 'Edinburgh', 'UK', 'Edinburgh', ARRAY['ed.ac.uk']),
  ('University of Lagos', 'UNILAG', 'Nigeria', 'Lagos', ARRAY['unilag.edu.ng']),
  ('University of Ibadan', 'UI', 'Nigeria', 'Ibadan', ARRAY['ui.edu.ng']),
  ('Covenant University', 'CU', 'Nigeria', 'Ota', ARRAY['covenantuniversity.edu.ng','stu.cu.edu.ng']),
  ('Obafemi Awolowo University', 'OAU', 'Nigeria', 'Ile-Ife', ARRAY['oauife.edu.ng']),
  ('Ahmadu Bello University', 'ABU', 'Nigeria', 'Zaria', ARRAY['abu.edu.ng']),
  ('University of Cape Town', 'UCT', 'South Africa', 'Cape Town', ARRAY['uct.ac.za','myuct.ac.za']),
  ('University of the Witwatersrand', 'Wits', 'South Africa', 'Johannesburg', ARRAY['wits.ac.za','students.wits.ac.za']),
  ('University of Sydney', 'USyd', 'Australia', 'Sydney', ARRAY['sydney.edu.au','uni.sydney.edu.au']),
  ('University of Melbourne', 'UniMelb', 'Australia', 'Melbourne', ARRAY['unimelb.edu.au','student.unimelb.edu.au']),
  ('National University of Singapore', 'NUS', 'Singapore', 'Singapore', ARRAY['nus.edu.sg','u.nus.edu']),
  ('University of Delhi', 'DU', 'India', 'Delhi', ARRAY['du.ac.in']);
