class AddUserToStats < ActiveRecord::Migration
  def change
  	    add_column :stat_delivers, :user, :bigint
	    add_column :stat_receives, :user, :bigint

      	add_index :stat_delivers, :user
  	  	add_index :stat_receives, :user
  end
end
