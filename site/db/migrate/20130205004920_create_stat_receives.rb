class CreateStatReceives < ActiveRecord::Migration
  def change
    create_table :stat_receives do |t|
      t.timestamp :from_time
      t.timestamp :to_time
      t.integer :count

      t.timestamps
    end
  end
end
