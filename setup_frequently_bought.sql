-- Create table for storing product associations (Frequently Bought Together)
create table if not exists product_associations (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null references products(id) on delete cascade,
  associated_product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('manual', 'auto')) default 'auto',
  score integer default 0, -- Auto: purchase count. Manual: arbitrary weight (e.g. 100)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraints
  constraint no_self_association check (product_id <> associated_product_id),
  constraint unique_association unique (product_id, associated_product_id)
);

-- Enable Row Level Security
alter table product_associations enable row level security;

-- Create policies
create policy "Public read access"
  on product_associations for select
  using (true);

create policy "Admins can manage associations"
  on product_associations for all
  using (
    auth.uid() in (
      select id from profiles where role in ('admin', 'super_admin')
    )
  );

-- Create function to automatically calculate associations from order history
create or replace function calculate_frequently_bought()
returns void
language plpgsql
security definer
as $$
begin
  -- 1. Clear existing 'auto' associations to refresh based on latest data
  delete from product_associations where type = 'auto';

  -- 2. Analyze order_items to find products bought together
  -- We look for pairs of products (A, B) that appear in the same order
  insert into product_associations (product_id, associated_product_id, type, score)
  select 
    t1.product_id,
    t2.product_id as associated_product_id,
    'auto',
    count(*) as score
  from order_items t1
  join order_items t2 on t1.order_id = t2.order_id 
  where t1.product_id <> t2.product_id -- Exclude self-matches
  group by t1.product_id, t2.product_id
  having count(*) >= 1 -- Threshold: Must appear together at least once
  order by score desc;
  
end;
$$;
