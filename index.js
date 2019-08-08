var request = require("request");

const baseUrl = 'https://www.life360.com/v3/'
const tokenUrl = 'oauth2/token.json'
const circlesUrl = 'circles.json'
const circleUrl = 'circles/'

let authorizationToken = ''
let username = ''
let password = ''
let accessToken = ''

const makeRequest = ((url, params = null, method = 'GET', authHeader = null) => {
	return new Promise((resolve, reject) => {
		let headers = {
			'Accept': 'application/json'
		}

		if (authHeader) {
			Object.assign(headers, { 'Authorization': authHeader, 'cache-control': "no-cache" })
		}

		if (method == 'GET') {
			request.get({ url: url, headers: headers }, (error, response, body) => {
				if (error) {
					reject(error)
				}

				resolve(response, body)
			})
		}

		if (method == 'POST') {
			request.post({ url: url, form: params, headers: headers }, (error, response, body) => {
				if (error) {
					reject(error)
				}

				resolve(response, body)
			})
		}
	})
})

const init = (token, user, pass) => {
	authorizationToken = 'Basic ' + token
	username = user
	password = pass
}

const authenticate = () => {

	return new Promise((resolve, reject) => {
		let url = baseUrl + tokenUrl

		let params = {
			'grant_type': 'password',
			'username': username,
			'password': password
		}

		makeRequest(url, params, 'POST', authorizationToken)
			.then((r) => {
				accessToken = 'Bearer ' + JSON.parse(r.body).access_token
				resolve(r)
			})
			.catch((e) => {
				reject(e)
			})

	})
}

const getCircles = () => {
	return new Promise((resolve, reject) => {
		let url = baseUrl + circlesUrl

		makeRequest(url, null, 'GET', accessToken)
			.then((r) => {
				resolve(JSON.parse(r.body).circles)
			})
			.catch((e) => {
				reject(e)
			})
	})
}

const getCircleById = (id) => {
	return new Promise((resolve, reject) => {
		let url = baseUrl + circleUrl + id

		makeRequest(url, null, 'GET', accessToken)
			.then((r) => {
				const bodyJson = JSON.parse(r.body)
				if (bodyJson.status === 404) {
					resolve(null)
				}

				resolve(r)
			})
			.catch((e) => {
				reject(e)
			})
	})
}

const searchMemberByFirstName = (circles, firstName) => {
	return new Promise((resolve, reject) => {
		circles.forEach(circle => {
			getCircleById(circle.id)
				.then((r) => {
					JSON.parse(r.body).members.forEach(member => {
						if (member.firstName.toLowerCase() == firstName.toLowerCase()) {
							resolve(member)
						}
					})

					resolve(null)
				})
				.catch((e) => {
					reject(e)
				})
		})
	})
}

module.exports = {
	init,
	authenticate,
	getCircles,
	getCircleById,
	searchMemberByFirstName
}
