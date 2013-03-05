class AddMultiUpdatedTimes < ActiveRecord::Migration
  def up
  	add_column :users, :today_updated, :integer
  	add_column :users, :tomorrow_updated, :integer
  	remove_column :users, :last_updated
  end

  def down
  end
end
