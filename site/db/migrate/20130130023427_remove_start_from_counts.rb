class RemoveStartFromCounts < ActiveRecord::Migration
  def up
  	remove_column :counts, :start
  end

  def down
  end
end
