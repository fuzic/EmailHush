class AddCalendarId < ActiveRecord::Migration
  def up
  	add_column :users, :calendar_id, :string
  end

  def down
  end
end
