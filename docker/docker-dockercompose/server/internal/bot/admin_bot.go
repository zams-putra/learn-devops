package bot

import (
	"context"
	"log"
	"time"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/chromedp"
)

type AdminBot struct {
	AdminCookie string
	TargetURL   string
}

func (b *AdminBot) visit() {
	log.Println("[bot] admin visiting comment page")
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	err := chromedp.Run(ctx,

		network.Enable(),

		// dev
		// chromedp.Navigate("http://localhost:5173"),

		// prods
		chromedp.Navigate("http://localhost:80"),

		chromedp.ActionFunc(func(ctx context.Context) error {
			return network.SetCookie("kuki", b.AdminCookie).WithDomain("localhost").WithPath("/").Do(ctx)
		}),

		chromedp.Navigate(b.TargetURL),
		chromedp.Sleep(5*time.Second),
	)

	if err != nil {
		log.Printf("[bot] Error adalah: %v", err)
		return
	}
	log.Println("[bot] Admin visit done kelar noh")
}

func (b *AdminBot) Start() {
	log.Println("[bot] Started visiting comment admin")
	for {
		time.Sleep(30 * time.Second)
		b.visit()
	}
}
