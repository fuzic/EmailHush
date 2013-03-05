class CreateReceiveKeys < ActiveRecord::Migration
  def up
  	add_index :stat_receives, [:from_time, :to_time], :unique=>true
  end

  def down
  end
end
