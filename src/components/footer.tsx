// components/footer.tsx

import React from "react"

export function Footer() {
  return (
    <div className="pt-24 ">
      <footer className="grid grid-cols-12 gap-4 pt-12 pb-24 xl:pb-44 p-4 text-black bg-gray-50 shadow-inner">
        <div className="text-2xl col-span-12 sm:col-span-7">
          <p className="pb-8 sm:pb-2">
            Founded in 2015, Spooky Books is an independent publisher focused on the production and dissemination of limited edition artists books.
          </p>
          <p>
            Our catalogue is primarily designed and produced on the unceded land of the Wurundjeri people of the Kulin Nation. We offer our respects to Elders past and present.
          </p>
        </div>
        <nav className="col-span-12 sm:col-start-9 sm:col-span-3" aria-label="footer">
          <ul>
            <li className="pb-8 sm:pb-2">
              Follow us on{" "}
              <a href="https://instagram.com/spooky.books/" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>For all enquiries:</li>
            <li className="pb-8 sm:pb-2">
              <a href="mailto:contact@spooky-books.com">contact@spooky-books.com</a>
            </li>
            <li className="pb-8 sm:pb-2">
              Photographs of books by{" "}
              <a href="https://mitchpinney.com/" target="_blank" rel="noreferrer">
                Mitch Pinney
              </a>{" "}
              and{" "}
              <a href="https://nicholasceckhardt.com/" target="_blank" rel="noreferrer">
                Nicholas Eckhardt
              </a>
              .
            </li>
            <li className="pb-8 sm:pb-2">
              Website by{" "}
              <a href="https://newassoc.world" target="_blank" rel="noreferrer">
                New Association
              </a>
            </li>
          </ul>
        </nav>
      </footer>
    </div>
  )
}
