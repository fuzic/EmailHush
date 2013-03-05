class AddIsolatedTokenFields < ActiveRecord::Migration
  def up
  	remove_column :users, :credentials
  	add_column :users, :auth_token, :string
  	add_column :users, :refresh_token, :string
  	add_column :users, :auth_exp, :integer
  end

  def down
  end
end
