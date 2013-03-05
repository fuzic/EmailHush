class AddTodayToUsers < ActiveRecord::Migration
  def change
    add_column :users, :today, :string
  end
end
