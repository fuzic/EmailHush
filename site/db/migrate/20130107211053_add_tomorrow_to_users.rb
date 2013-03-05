class AddTomorrowToUsers < ActiveRecord::Migration
  def change
    add_column :users, :tomorrow, :string
  end
end
