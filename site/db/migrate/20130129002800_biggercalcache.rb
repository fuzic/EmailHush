class Biggercalcache < ActiveRecord::Migration
  def up
  	remove_column :users, :calendar_cache
  	add_column :users, :calendar_cache, :mediumtext
  end

  def down
  end
end
