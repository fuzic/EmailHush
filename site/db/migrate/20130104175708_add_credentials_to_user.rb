class AddCredentialsToUser < ActiveRecord::Migration
  def change
    add_column :users, :credentials, :string
  end
end
