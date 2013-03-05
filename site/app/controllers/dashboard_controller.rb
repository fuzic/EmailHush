class DashboardController < ApplicationController
	layout "authenticated"
	def index
		loc = current_user.timezone
		zone_name = ActiveSupport::TimeZone::MAPPING.keys.find do |name|
			ActiveSupport::TimeZone[name].tzinfo.identifier == loc
		end

		begin
			zone = ActiveSupport::TimeZone[zone_name]
		rescue
			zone = ActiveSupport::TimeZone['Eastern Time (US & Canada)']
		end
		@now = zone.at(Time.now)
		@created = current_user.created_at
		if current_user.calendar_cache_updated
			@last_updated = Time.at((current_user.calendar_cache_updated / 1000).to_i())
		end
		@username = current_user.name || ''
		@ordinance = ["th","st","nd","rd","th","th","th","th","th","th"]
		@timezones = timezone_picker_parse_files(874, 437, 'app/data/tz_world.txt', 'app/data/tz_islands.txt')
	end


	def timezone_picker_parse_files(map_width, map_height, tz_world, tz_islands)
		timezones = Hash.new()

		file = File.open(tz_world, "rb")
		contents = file.read
		file.close()

		rows = contents.split("\n")
		rows.each do |row|
			next if (row.blank?)

			s = row.split('|')
			timezone_name = s[0]
			timezone_data = s[1]

			next if (timezone_name.blank?)

			if (!timezones.has_key?(timezone_name))
				timezones[timezone_name] = Hash.new()
				if (timezone = ActiveSupport::TimeZone.new(timezone_name))
					timezones[timezone_name]['offset'] = (timezone.utc_offset() / 360).round() / 10
				else
					timezones[timezone_name]['offset'] = nil
				end
				timezones[timezone_name]['polys'] = []
				timezones[timezone_name]['rects'] = []
			end

			timezone_data = timezone_data[13, timezone_data.length - 1]

			polys = timezone_data.split(')),((')

			polys.each do |poly|
				poly = poly.gsub(/\A[\)\()]+|[\)\()]+\Z/, "")

				s = poly.split('),(')
				outer_poly = s[0]

				area_poly = []
				longlats = outer_poly.split(',')
				longlats.each do |longlat|
					s = longlat.split(' ')
					longitude = s[0].to_f
					latitude = s[1].to_f
					
					s = timezone_picker_convert_xy(latitude, longitude, map_width, map_height)
					area_poly << s[0]
					area_poly << s[1]
				end
				timezones[timezone_name]['polys'] << area_poly
			end
		end

		if (File.exist?(tz_islands))
			file = File.open(tz_islands, "rb")
			contents = file.read
			file.close()

			rows = contents.split("\n")

			rows.each do |row|
				s = row.split('|')
				timezone_name = s[0]
				timezone_data = s[1]

				next if (timezone_name === 'Pacific/Fiji' || timezone_name === 'Pacific/Auckland')

				timezone_data = timezone_data[4, timezone_data.length - 1]

				area_poly = []
				longlats = timezone_data.gsub(/\A[\)\()]+|[\)\()]+\Z/, "").split(',')

				s = longlats[0].split(' ')
				s = timezone_picker_convert_xy(s[1].to_f, s[0].to_f, map_width, map_height)
				x1 = s[0]
				y1 = s[1]
				s = longlats[1].split(' ')
				s = timezone_picker_convert_xy(s[1].to_f, s[0].to_f, map_width, map_height)
				x2 = s[0]
				y2 = s[1]

				if (x2 - x1 < 10)
					x1 -= 5;
					x2 += 5;
				end
				if (y1 - y2 < 10)
					y2 -= 5;
					y1 += 5;
				end

				if (timezones.has_key?(timezone_name))
					timezones[timezone_name]['rects'] = [[x1, y1, x2, y2]]
					if (timezones[timezone_name]['polys'].length === 1)
						timezones[timezone_name]['polys'] = []
					end
				end
			end
		end
		return timezones
	end

	def timezone_picker_convert_xy(latitude, longitude, map_width, map_height)
		x = ((longitude.to_f + 180) * (map_width.to_f / 360)).round()
		y = (((latitude.to_f * -1) + 90) * (map_height.to_f / 180)).round()
		return [x, y]
	end
end
