class CreateDeliverKeys < ActiveRecord::Migration
  def up
  	add_index :stat_delivers, [:from_time, :to_time, :duration], :unique=>true
  end

  def down
  end
end
