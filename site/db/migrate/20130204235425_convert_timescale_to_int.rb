class ConvertTimescaleToInt < ActiveRecord::Migration
  def up
  	remove_column :counts, :timescale
  	add_column :counts, :timescale, :int
  end

  def down
  end
end
