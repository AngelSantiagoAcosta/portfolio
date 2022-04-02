from flask import Flask, render_template, url_for

app = Flask(__name__)
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
	return render_template('about.html')

#portfolio page route
@app.route("/portfolio", methods= ['GET', 'POST'])
def portfolio():
	return render_template('portfolio.html')


#contact me page route
@app.route("/contact")
def contact():
	return render_template('contact.html')

#contact me page route
@app.route("/crypto")
def crypto():
	return render_template('/projects/CryptoAPI.html  ')
 
if __name__ == "__main__":
    app.run(debug=True)



