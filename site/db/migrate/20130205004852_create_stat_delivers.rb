class CreateStatDelivers < ActiveRecord::Migration
  def change
    create_table :stat_delivers do |t|
      t.timestamp :from_time
      t.timestamp :to_time
      t.integer :duration
      t.integer :count

      t.timestamps
    end
  end
end
