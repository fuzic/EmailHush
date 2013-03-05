# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130205011144) do

  create_table "stat_delivers", :force => true do |t|
    t.datetime "from_time"
    t.datetime "to_time"
    t.integer  "duration"
    t.integer  "count"
    t.datetime "created_at",              :null => false
    t.datetime "updated_at",              :null => false
    t.integer  "user",       :limit => 8
  end

  add_index "stat_delivers", ["from_time", "to_time", "duration"], :name => "index_stat_delivers_on_from_time_and_to_time_and_duration", :unique => true
  add_index "stat_delivers", ["user"], :name => "index_stat_delivers_on_user"

  create_table "stat_receives", :force => true do |t|
    t.datetime "from_time"
    t.datetime "to_time"
    t.integer  "count"
    t.datetime "created_at",              :null => false
    t.datetime "updated_at",              :null => false
    t.integer  "user",       :limit => 8
  end

  add_index "stat_receives", ["from_time", "to_time"], :name => "index_stat_receives_on_from_time_and_to_time", :unique => true
  add_index "stat_receives", ["user"], :name => "index_stat_receives_on_user"

  create_table "users", :force => true do |t|
    t.string   "email"
    t.string   "provider"
    t.datetime "created_at",                                                :null => false
    t.datetime "updated_at",                                                :null => false
    t.string   "uid"
    t.integer  "state"
    t.string   "refresh_token"
    t.string   "calendar_id"
    t.string   "timezone"
    t.string   "name"
    t.integer  "override",                                   :default => 0
    t.integer  "override_mode",                              :default => 0
    t.integer  "calendar_cache_updated", :limit => 8,        :default => 0
    t.text     "calendar_cache",         :limit => 16777215
  end

end
