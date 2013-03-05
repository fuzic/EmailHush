class AddInspected < ActiveRecord::Migration
  def up
  	add_column :users, :inspected, :integer, :default => 0
  end

  def down
  end
end
