const reset_password = (name, email, token) => {
    return `<div>
                <main>
                    <div>
                        <h1>Hello, ${name}, your email id is ${email} </h1>
                        <h3>Follow this link to reset your password..</h3>
                        <p>
                            <strong>
                                <a class="btn" target="_blank" href="http://localhost:4000/password/reset?token=${token}">
                                    Reset Password
                                </a>
                            </strong>
                        </p>
                        <p>If you didn't ask to reset your password, ignore this link</p>

                        <h3>Thanks & Regards</h3>
                        <h4>Team API.</h4>
                    </div>
                </main>
            </div>`
}

module.exports = reset_password