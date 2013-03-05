class AddLastUpdatedToUsers < ActiveRecord::Migration
  def change
    add_column :users, :last_updated, :integer
  end
end
