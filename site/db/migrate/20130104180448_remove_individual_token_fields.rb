class RemoveIndividualTokenFields < ActiveRecord::Migration
  def change
  	remove_column :users, :access_token
  	remove_column :users, :refresh_token
  end
end
