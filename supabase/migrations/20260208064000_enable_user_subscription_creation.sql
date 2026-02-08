-- Allow authenticated users to insert their own customer record (if it matches their email)
create policy "Allow users to create their own customer profile"
  on customers
  for insert
  to authenticated
  with check ( auth.email() = email );

-- Allow authenticated users to create subscriptions linked to their customer profile
create policy "Allow users to start subscriptions"
  on subscriptions
  for insert
  to authenticated
  with check (
    customer_id in (
      select id from customers where email = auth.email()
    )
  );

-- Allow authenticated users to view their own subscriptions
create policy "Allow users to view their own subscriptions"
  on subscriptions
  for select
  to authenticated
  using (
    customer_id in (
      select id from customers where email = auth.email()
    )
  );
