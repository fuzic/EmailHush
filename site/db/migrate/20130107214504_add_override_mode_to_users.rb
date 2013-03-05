class AddOverrideModeToUsers < ActiveRecord::Migration
  def change
    add_column :users, :override_mode, :integer
  end
end
