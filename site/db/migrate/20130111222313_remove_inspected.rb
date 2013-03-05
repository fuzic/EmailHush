class RemoveInspected < ActiveRecord::Migration
  def up
  	remove_column :users, :inspected
  end

  def down
  end
end
