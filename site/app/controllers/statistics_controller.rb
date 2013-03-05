class StatisticsController < AccountsController
	respond_to :json

	def show
		if !session[:user_id]
			return
		end

		type = params[:type]

		if type == 'volume'
			stats = StatReceive.get(session[:user_id])
		elsif type == 'delay'
			stats = StatDeliver.get(session[:user_id])
		end

		respond_with do |format|
			format.json {
				render :layout => false, :text => stats.to_json()
			}
		end
	end
end
