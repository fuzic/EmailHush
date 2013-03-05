class AddTodayDateToUsers < ActiveRecord::Migration
  def change
    add_column :users, :today_date, :string
  end
end
