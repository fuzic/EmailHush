class RegensController < AccountsController
	respond_to :json

	def create
		
		@client = Google::APIClient.new
		@client.authorization.access_token = session[:cred].token

		case (params[:type])
		when 'gcal'
			initGCal()
		when 'gmail'
			initGMail()
		end

		respond_with do |format|
			format.json {
				render :layout => false, :text => {:success => true}.to_json()
			}
		end
	end

	private

	def initGCal
		service = @client.discovered_api('calendar', 'v3')

		result = @client.execute(
			:api_method => service.calendars.get,
			:parameters => {'calendarId' => current_user.calendar_id},
			:headers => {'Content-Type' => 'application/json'})

		if !result.data || (result.data["error"] && result.data.error["code"] == 404)

			timeZone = current_user.timezone

			if !timeZone
				calList = @client.execute(
					:api_method => service.calendar_list.list,
					:parameters => {},
					:headers => {'Content-Type' => 'application/json'})

				timeZone = calList.data.items[0]["timeZone"]
				current_user.update_attributes(:timezone => timeZone)
			end

			creation = @client.execute(
				:api_method => service.calendars.insert,
				:body_object => {
						'summary' => 'EmailHush',
						'description' => 'Events in this calendar mark times when mail will be delivered.'
					},
				:headers => {'Content-Type' => 'application/json'})

			current_user.update_attributes(:calendar_id => creation.data.id)

			event = @client.execute(
				:api_method => service.events.insert,
				:parameters => {
					'calendarId' => current_user.calendar_id
				},
				:body_object => {
						'start' => {
								'dateTime' => '2012-12-31T9:00:00.000',
								'timeZone' => timeZone
							},
						'end' => {
								'dateTime' => '2012-12-31T17:00:00.000',
								'timeZone' => timeZone
							},
						'summary' => 'Deliver Mail',
						'recurrence' => [
							"RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
						]
					},
				:headers => {'Content-Type' => 'application/json'})
		end
	end

	def initGMail
		require 'net/imap'
		require 'gmail_xoauth'

		logger.info session[:cred]

		imap = Net::IMAP.new('imap.gmail.com', 993, usessl = true, certs = nil, verify = false)
		imap.authenticate('XOAUTH2', current_user.email, session[:cred].token)

		begin
			imap.select('EmailHush')
		rescue
			imap.create('EmailHush')
		end

		imap.disconnect()
	end
end
