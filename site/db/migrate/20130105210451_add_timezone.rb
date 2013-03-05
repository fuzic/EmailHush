class AddTimezone < ActiveRecord::Migration
  def up
  	add_column :users, :timezone, :string
  end

  def down
  end
end
