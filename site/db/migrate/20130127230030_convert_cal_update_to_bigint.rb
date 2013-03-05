class ConvertCalUpdateToBigint < ActiveRecord::Migration
  def up
  	remove_column :users, :calendar_cache_updated
  	add_column :users, :calendar_cache_updated, :bigint, :default => 0
  end

  def down
  end
end