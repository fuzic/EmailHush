class AddOverrideToUsers < ActiveRecord::Migration
  def change
    add_column :users, :override, :integer
  end
end
