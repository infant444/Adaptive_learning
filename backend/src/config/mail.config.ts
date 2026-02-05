import Mailgen from "mailgen";

export const MailConfig={
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER!,
        pass:process.env.EMAIL_PASSWORD!,
    }
}
export const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Sancilo',
      link: 'http://localhost:3000',
      copyright: `© ${new Date().getFullYear()} Sancilo. All rights reserved.`
    }
});