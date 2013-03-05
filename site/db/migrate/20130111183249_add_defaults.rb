class AddDefaults < ActiveRecord::Migration
  def up
  	remove_column :users, :auth_token
  	remove_column :users, :auth_exp
  	remove_column :users, :override
  	remove_column :users, :override_mode
  	remove_column :users, :override_mode

  	add_column :users, :override, :integer, :default => 0
  	add_column :users, :override_mode, :integer, :default => 0
  end

  def down
  end
end
