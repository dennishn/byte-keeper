import type { ComponentPropsWithRef, HTMLAttributes } from "react";
import { cn } from "@/styles/utils";
import { cva, type VariantProps } from "class-variance-authority";

const headingVariants = cva("text-balance", {
    variants: {
        size: {
            h1: "text-4xl font-extrabold tracking-tight",
            h2: "border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
            h3: "text-2xl font-semibold tracking-tight",
            h4: "text-xl font-semibold tracking-tight",
        },
    },
});

type HeadingProps = ComponentPropsWithRef<"h1"> &
    HTMLAttributes<HTMLHeadingElement> &
    VariantProps<typeof headingVariants> & {
        as?: "h1" | "h2" | "h3" | "h4";
    };

const Heading = ({
    className,
    size,
    as: Component = "h2",
    ref,
    ...props
}: HeadingProps) => {
    return (
        <Component
            className={cn(headingVariants({ size, className }))}
            ref={ref}
            {...props}
        />
    );
};

type ParagraphProps = ComponentPropsWithRef<"p"> &
    HTMLAttributes<HTMLParagraphElement>;

const Paragraph = ({ className, ref, ...props }: ParagraphProps) => {
    return (
        <p
            className={cn("leading-7 not-first:mt-6", className)}
            ref={ref}
            {...props}
        />
    );
};

type ListProps = ComponentPropsWithRef<"ul"> & HTMLAttributes<HTMLUListElement>;

const List = ({ className, ref, ...props }: ListProps) => {
    return (
        <ul
            className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
            ref={ref}
            {...props}
        />
    );
};

type ListItemProps = ComponentPropsWithRef<"li"> &
    HTMLAttributes<HTMLLIElement>;

const ListItem = ({ className, ref, ...props }: ListItemProps) => {
    return <li className={cn(className)} ref={ref} {...props} />;
};

export { Heading, Paragraph, List, ListItem };
