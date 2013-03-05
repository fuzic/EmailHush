class ConsolidateCalendars < ActiveRecord::Migration
  def up
  	remove_column :users, :today_updated
  	remove_column :users, :tomorrow_updated
  	remove_column :users, :today_date
  	remove_column :users, :today
  	remove_column :users, :tomorrow
	add_column :users, :calendar_cache, :string
	add_column :users, :calendar_cache_updated, :integer
  end

  def down
  end
end
